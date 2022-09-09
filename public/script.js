const cartItems = [
    { id: 1, quantity: 3 },
    { id: 2, quantity: 1 }
]

const paypalButtonsComponent = paypal.Buttons({
    // optional styling for buttons
    // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
    style: {
        color: "gold",
        shape: "rect",
        layout: "vertical",
    },

    // set up the transaction
    createOrder: () => {
        return fetch('/create-order', {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                items: cartItems
            })
        }).then(res => {
            if (res.ok) return res.json()

            // Otherwise
            return res.json().then(json => Promise.reject(json))
        }).then(({ id }) => {
            return id
        }).catch(err => {
            console.error(err.error)
        })
    },

    // finalize the transaction
    onApprove: (data, actions) => {
        const captureOrderHandler = (details) => {
            const payerName = details.payer.name.given_name;
            console.log("Transaction completed");
            console.log(`Payer : ${payerName}`)
        };

        return actions.order.capture().then(captureOrderHandler);
    },

    // handle unrecoverable errors
    onError: (err) => {
        console.error(
            "An error prevented the buyer from checking out with PayPal"
        );
    },
});

paypalButtonsComponent.render("#paypal-button-container").catch((err) => {
    console.error("PayPal Buttons failed to render");
});