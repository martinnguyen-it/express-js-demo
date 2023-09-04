const paypal = require('paypal-rest-sdk');

paypal.configure({
    mode: 'sandbox',
    client_id:
        'EDsugVozIjaGuI9etNA8njH17Od7jp102IC6DOIF4H2R6p3xn8k8IiFwlAso-bRnAbBXZOvhT174dalr',
    client_secret:
        'EDsugVozIjaGuI9etNA8njH17Od7jp102IC6DOIF4H2R6p3xn8k8IiFwlAso-bRnAbBXZOvhT174dalr',
});

paypal.openIdConnect.tokeninfo.refresh(
    '"A21AAIvG4_hqR5lN1ZN04WSH3r_VuS8bqoLdhoHFsAr2GnP3WNiA6TkJb83e253xhDzJn94iPi5TJr1F7jw3pm9M14WEf4G-A"',
    (error, tokeninfo) => {
        console.log(tokeninfo);
    },
);
