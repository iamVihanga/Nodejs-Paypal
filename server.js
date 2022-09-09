if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const PORT = process.env.PORT || 3000

const express = require('express')
const app = express()
const paypal = require('@paypal/checkout-server-sdk')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())

const Environment = process.env.NODE_ENV === 'production'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment

const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)

const storeItems = [
    { id: 1, name: 'Learn React Today', price: 49.50 },
    { id: 2, name: "Angular Full Course", price: 68.00 }
]

app.get('/', (req, res) => {
    res.render('index', {
        paypalClientId: process.env.PAYPAL_CLIENT_ID
    })
})

app.post('/create-order', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest()

    // Calculate total
    let total = 0
    req.body.items.forEach(item => {
        const itemJson = storeItems.find(i => i.id == item.id)
        total = total + itemJson.price * item.quantity
    })

    request.prefer("return=representation")
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: total,
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: total
                        }
                    }
                },
                items: req.body.items.forEach(item => {
                    const itemJson = storeItems.find(i => i.id == item.id)
                    return {
                        name: itemJson.name,
                        unit_amount: {
                            currency_code: "USD",
                            value: itemJson.price
                        },
                        quantity: item.quantity
                    }
                })
            },
        ],
    })

    try {
        const order = await paypalClient.execute(request)
        res.json({ id: order.result.id })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Listen to server
app.listen(PORT, () => console.log('Server Started Listening on PORT :', PORT))