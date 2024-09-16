const functions = require("firebase-functions");
const admin = require("firebase-admin");
const request = require('request');
const axios = require('axios');
const formData = require("form-data");


const REGION = "asia-east1";

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const line_token = "aTZa3bg8NRu34ZZBA5DhRkbSoeQ2u5ioNArB4pKvnTw";

function isEmpty(checkValue) {
    if (checkValue === undefined || checkValue === null || checkValue === "" || checkValue + "" === "null") {
        return true;
    }
    return false;
}

exports.onWriteUsers = functions.firestore.document('users/{user_id}')
    .onWrite(async (snap, context) => {

        const before = snap.before.data();
        const original = snap.after.data();
        const user_id = context.params.user_id;

        if (isEmpty(before)) {
            return;
        }

        if (isEmpty(original)) {
            return;
        }

        if (isEmpty(before.phone_number)) {
            let message = "มีการสมัครสมาชิกใหม่จากคุณ ";
            message = message + original.first_name + " " + original.last_name;
            message = message + "\n" + "เบอร์โทร : " + original.phone_number;
            message = message + "\n" + "อีเมล : " + original.email;
            sendLineNotify(message, line_token);
        }



    });

exports.onCreateIssueList = functions.firestore.document('issue_list/{doc_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const doc_id = context.params.doc_id;

        let message = "มีการแจ้งปัญหาการใช้งานจากคุณ ";
        message = message + original.contact_name;
        message = message + "\n" + "เบอร์โทร : " + original.contact_phone;
        message = message + "\n" + "หัวข้อ : " + original.subject;
        message = message + "\n" + "รายละเอียด : " + original.detail;
        sendLineNotify(message, line_token);


    });



exports.onCreatePaymentList = functions.firestore.document('payment_list/{doc_id}')
    .onCreate(async (snap, context) => {

        const original = snap.data();
        const doc_id = context.params.doc_id;

        let message = "มีการแจ้งโอนเงินจาก ";
        message = message + original.customer_name + "(" + original.customer_ref.id + ")";
        message = message + "\n" + "รูปหลักฐานการโอนเงิน : ";
        sendLineNotify(message, line_token, original.image_slip, original.image_slip);

    });

function sendLineNotify(message, token, image1, image2) {

    // image1,2 is url path

    const data = new formData();
    data.append("message", message);

    if (!isEmpty(image1) && !isEmpty(image2)) {
        data.append("imageThumbnail", image1);
        data.append("imageFullsize", image2);
    }

    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://notify-api.line.me/api/notify",
        headers: {
            "content-type": "application/json",
            "Authorization": "Bearer " + token,
            ...data.getHeaders(),
        },
        data: data,
    };

    axios.request(config);
}
