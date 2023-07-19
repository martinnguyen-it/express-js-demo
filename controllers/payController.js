/* eslint-disable camelcase */
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');

function sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    // eslint-disable-next-line no-restricted-syntax
    for (key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    // eslint-disable-next-line no-plusplus
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(
            /%20/g,
            '+',
        );
    }
    return sorted;
}

exports.createPaymentURL = (req, res, next) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    const ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const tmnCode = process.env.VNPAY_TMNCODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    let vnpUrl = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;

    const orderId = moment(date).format('DDHHmmss');
    const { amount } = req.body;
    const { bankCode } = req.body;

    let locale = req.body.language;
    if (!locale) {
        locale = 'vn';
    }
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params.vnp_Version = '2.1.0';
    vnp_Params.vnp_Command = 'pay';
    vnp_Params.vnp_TmnCode = tmnCode;
    vnp_Params.vnp_Locale = locale;
    vnp_Params.vnp_CurrCode = currCode;
    vnp_Params.vnp_TxnRef = orderId;
    vnp_Params.vnp_OrderInfo = `Thanh toan cho ma GD: ${orderId}`;
    vnp_Params.vnp_OrderType = 'other';
    vnp_Params.vnp_Amount = amount * 100;
    vnp_Params.vnp_ReturnUrl = returnUrl;
    vnp_Params.vnp_IpAddr = ipAddr;
    vnp_Params.vnp_CreateDate = createDate;
    if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    // eslint-disable-next-line no-buffer-constructor
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params.vnp_SecureHash = signed;
    vnpUrl += `?${querystring.stringify(vnp_Params, { encode: false })}`;

    res.status(200).json({ status: 'success', data: { vnpUrl } });
};
