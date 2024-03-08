const { Router } = require('express')
const CartManager = require('../CartManager');
const ProductManager = require('../ProductManager')

const router = Router()

const fileNameCarts = `${__dirname}/../../carts.json`
const cartsManager = new CartManager(fileNameCarts)
const fileNameProducts = `${__dirname}/../../products.json`
const productManager = new ProductManager(fileNameProducts)

//middlewares

async function validateNewCart(req, res, next) {
    const { products } = req.body    

    //valido que cada producto que quiero agregar a un carrito exista y que su quantity sea un valor positivo
    products.forEach(producto => {
        const prod = productManager.getProductById(producto.id)
        if (!prod) {
            res.status(400).json({ error: `No se puede crear el carrito porque no existe el producto con ID '${producto.id}'.`})
            return
        }
        //valido además que su campo quantity sea un valor positivo
        if (!productManager.esPositivo(producto.quantity)) {
            res.status(400).json({ error: `El valor de quantity del producto con ID '${producto.id}' es inválido.`})
            return
        }
    })
    //exito, continuo al endpoint
    return next()
}

async function validateCart(req, res, next) {
    let cartId = +req.params.cid;

    const cart = cartsManager.getCartById(cartId)
    if (!cart) {
        res.status(400).json({ error: `No existe el carrito con ID '${cartId}'.`})
        return
    }
    //exito, continuo al endpoint
    return next()
}

async function validateProduct(req, res, next) {
    let prodId = +req.params.pid;

    const prod = productManager.getProductById(prodId)
    if (!prod) {
        res.status(400).json({ error: `No existe el producto con ID '${prodId}'.`})
        return
    }
    //exito, continuo al endpoint
    return next()
}

//endpoints

router.get('/:cid', async (req, res) => {
    let cartId = +req.params.cid;

    if (isNaN(cartId)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Formato invalido del ID del carrito." })
        return
    }

    let cartById = await cartsManager.getCartById(cartId);

    if (cartById) 
        // HTTP 200 OK => se encontró el carrito
        res.status(200).json(cartById)    
    else {
        // HTTP 404 => el ID es válido, pero no se encontró ese carrito
        res.status(404).json(`El carrito con código '${cartId}' no existe.`)  
        return
    }    
})

router.post('/', validateNewCart, async (req, res) => {
    const { products } = req.body;

    await cartsManager.addCart(products);

    // HTTP 201 OK => carrito creado exitosamente
    res.status(201).json(`Carrito creado exitosamente.`)
})

router.post('/:cid/product/:pid', validateCart, validateProduct, async (req, res) => {
    let cartId = +req.params.cid;
    let prodId = +req.params.pid;
    let quantity = 1;

    await cartsManager.addProductToCart(cartId, prodId, quantity);

    // HTTP 200 OK => carrito modificado exitosamente
    res.status(200).json(`Se agregaron ${quantity} producto/s con ID ${prodId} al carrito con ID ${cartId}.`)
})

//init methods

const main = async () => {
    await cartsManager.inicializar()
}

main()

module.exports = router;