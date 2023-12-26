/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const REGION = "asia-east2";
admin.initializeApp();
const db = admin.firestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

exports.testFun = onRequest(async (request, response) => {

    const currentDate = new Date();
    // เช็คก่อนว่ามันมีมากกว่า 8 คนมั้ย
    const rsCompany = await db.collection('company_list').where('status', '==', 1).get();
    for (var i = 0; i < rsCompany.size; i++) {
        const rsEmployee = await db.collection('employee_list').where('status', '==', 1).where('company_ref', '==', rsCompany.docs[i].ref).get();
        console.log("rsEmployee.size : " + rsEmployee.size);
        if (rsEmployee.size > 8) {
            console.log(rsCompany.docs[i].data()["expire_date"].toDate());
            console.log(currentDate);
            if (currentDate >= rsCompany.docs[i].data()["expire_date"].toDate()) {
                db.doc(rsCompany.docs[i].ref.path).update({
                    "is_paid": false,
                });
            }
        }
    }

    response.send("Hello from Firebase!");
});


exports.checkIsExpireSubscript = functions
    .pubsub.schedule('0 23 * * *')
    .timeZone('Asia/Bangkok')
    .onRun(async (context) => {

        const currentDate = new Date();
        // เช็คก่อนว่ามันมีมากกว่า 8 คนมั้ย
        const rsCompany = await db.collection('company_list').where('status', '==', 1).get();
        for (var i = 0; i < rsCompany.size; i++) {
            const rsEmployee = await db.collection('employee_list').where('status', '==', 1).where('company_ref', '==', rsCompany.docs[i].ref).get();
            console.log("rsEmployee.size : " + rsEmployee.size);
            if (rsEmployee.size > 8) {
                console.log(rsCompany.docs[i].data()["expire_date"].toDate());
                console.log(currentDate);
                if (currentDate >= rsCompany.docs[i].data()["expire_date"].toDate()) {
                    db.doc(rsCompany.docs[i].ref.path).update({
                        "is_paid": false,
                    });
                }
            }
        }

    });