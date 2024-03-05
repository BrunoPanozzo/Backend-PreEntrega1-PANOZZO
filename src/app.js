const express = require('express')
const ProductManager = require('./ProductManager')

const app = express()
app.use(express.urlencoded({ extended: true }))

const productManager = new ProductManager(`{ __dirname }/../products.json`)

app.get('/products', async (req, res) => {
    const { limit } = req.query    
    let products = await productManager.getProducts()

    const filteredProducts = limit
        ? products.splice(0, limit)
        : products
    res.send(filteredProducts)
})

app.get('/products/:pid', async (req, res) => {
    const prodId = +req.params.pid
    const product = productManager.getProductById(prodId)

    if (product)
        res.send(product)
    else
        res.send(`El producto con código \"${prodId}\" no existe`)
})

const main = async () => {
    await productManager.inicializar()

    app.listen(8080, () => {
        console.log('Servidor listo escuchando en el puerto 8080')
    })
}

main()