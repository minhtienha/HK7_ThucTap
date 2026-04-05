const axios = require("axios");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const { datVeNhieuGhe } = require("./veController");
const { sendSuccess, sendError } = require("../utils/responseHelper");

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";
const requestType = "payWithMethod";
const defaultRedirectUrl = process.env.MOMO_REDIRECT_URL;
const defaultIpnUrl = process.env.MOMO_IPN_URL;

// [POST] Tạo thanh toán MoMo
const createMoMoPayment = asyncHandler(async (req, res) => {
  const { amount, orderId, orderInfo, redirectUrl, ipnUrl, extraData } = req.body;
  const requestId = partnerCode + Date.now();
  const finalOrderId = orderId || requestId;
  
  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData || ""}` +
    `&ipnUrl=${ipnUrl || defaultIpnUrl}` +
    `&orderId=${finalOrderId}` +
    `&orderInfo=${orderInfo || "Thanh toán với MoMo"}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl || defaultRedirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId: finalOrderId,
    orderInfo: orderInfo || "Thanh toán với MoMo",
    redirectUrl: redirectUrl || defaultRedirectUrl,
    ipnUrl: ipnUrl || defaultIpnUrl,
    extraData: extraData || "",
    requestType,
    signature,
    lang: "vi",
  };

  const response = await axios.post(endpoint, requestBody, {
    headers: { "Content-Type": "application/json" },
  });

  // Sử dụng sendSuccess để chuẩn hóa kết quả MoMo
  sendSuccess(res, 200, "Khởi tạo thanh toán MoMo thành công", response.data);
});

// [POST] Xử lý callback từ MoMo (IPN)
const handleMoMoCallback = asyncHandler(async (req, res) => {
  const {
    partnerCode: resPartnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature: resSignature,
  } = req.body;

  // 1. Xác thực chữ ký (Security Check)
  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData || ""}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${resPartnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const checkSignature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  if (checkSignature !== resSignature) {
    console.error("❌ MoMo Callback: Chữ ký không hợp lệ!");
    return res.status(400).json({ status: "Error", message: "Invalid signature" });
  }

  console.log(`📩 MoMo Callback [${orderId}]: resultCode=${resultCode}, message=${message}`);

  // 2. Xử lý kết quả giao dịch
  if (resultCode === 0) {
    let bookingData = {};
    try {
      bookingData = typeof extraData === "string" ? JSON.parse(extraData) : extraData;
    } catch (e) {
      console.error("❌ MoMo Callback: Lỗi phân tích extraData", e);
      return res.status(400).json({ status: "Error", message: "Invalid metadata" });
    }

    // Gọi logic đặt vé
    await datVeNhieuGhe(
      { body: bookingData },
      {
        status: (code) => ({
          json: (data) => console.log(`✅ Ticket created via MoMo [${orderId}]:`, data),
        }),
      }
    );
  }

  // MoMo yêu cầu trả về status 204 hoặc 200
  res.status(204).send();
});

module.exports = { createMoMoPayment, handleMoMoCallback };
