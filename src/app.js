const express = require('express')

const productRouter = require('./routes/product.router')
const cartRouter = require('./routes/cart.router')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)

app.listen(8080, () => {
    console.log('Servidor listo escuchando en el puerto 8080')
});

