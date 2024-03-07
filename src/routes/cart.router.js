const { Router } = require('express')

const router = Router();

const CartManager = require('../CartManager');
const ProductManager = require('../ProductManager')

const filenameCarts = `${__dirname}/../../carrito.json`
const cartsManager = new CartManager(filenameCarts)
const fileNameProducts = `${__dirname}/../../products.json`
const productsManager = new ProductManager(fileNameProducts)

async function validarCampos(req, res, next) {
    const { products } = req.body;

    const listadoProductos = await productsManager.getProducts()
    products.forEach(producto => {
        //valido que el producto exista y que quantity sea un entero positivo
        const codeIndex = listadoProductos.findIndex(e => e.id === producto.pid);
        if (codeIndex === -1) {
            res.status(400).json({ error: `No existe el producto con ID '${producto.pid}'` })
            return
        }
        //valido el campo quantity //agregar > 0
        if (isNaN(producto.quantity)) {
            res.status(400).json({ error: `La cantidad del producto con ID '${producto.pid}' es negativa` })
            return
        }
    });

    return next()
}

async function validarCarrito(req, res, next) {
    let cartId = +req.params.cid;

    const listadoCarritos = await cartsManager.getCarts()
    const codeIndex = listadoCarritos.findIndex(e => e.id === cartId);
    if (codeIndex === -1) {
        res.status(400).json({ error: `No existe el carrito con ID '${cartId}'` })
        return
    }

    return next()
}

async function validarProducto(req, res, next) {
    let prodId = +req.params.pid;

    const listadoProductos = await productsManager.getProducts()
    const codeIndex = listadoProductos.findIndex(e => e.id === prodId);
    if (codeIndex === -1) {
        res.status(400).json({ error: `No existe el producto con ID '${prodId}'` })
        return
    }

    return next()
}

router.post('/', validarCampos, async (req, res) => {
    const { products } = req.body;

    const nuevoCarrito = await cartsManager.addCart(products);

    res.status(201).json({ message: "Carrito agregado correctamente", carrito: nuevoCarrito })
})

router.get('/:cid', async (req, res) => {
    let cartId = +req.params.cid;

    if (isNaN(cartId)) {
        // HTTP 400 => hay un error en el request o alguno de sus parámetros
        res.status(400).json({ error: "Formato invalido del ID del carrito" })
        return
    }

    let cartById = await cartsManager.getCartByCId(cartId);

    if (!cartById) {
        res.status(404).json({ error: "Id inexistente!" })  // HTTP 404 => el ID es válido, pero no se encontró ese carrito
        return
    }
    res.status(200).json(cartById)    // HTTP 200 OK
})

router.post('/:cid/product/:pid', validarCarrito, validarProducto, async (req, res) => {
    let cartId = +req.params.cid;
    let prodId = +req.params.pid;
    let quantity = 1;

    await cartsManager.addProductToCart(cartId, prodId, quantity);

    res.status(200).json(nuevoProd)    // HTTP 200 OK
})

const main = async () => {
    await cartsManager.inicializar()
}

main()

module.exports = router;