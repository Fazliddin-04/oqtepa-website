import { useCallback, useRef } from "react"
import { useSelector } from "react-redux"

export default function useCartProduct(productId) {
  const { cart } = useSelector((state) => state.cart)
  const productInCart = useRef(null)
  const isOrdered = useRef(false)

  const onCheckProduct = useCallback(() => {
    if (cart.length > 0) {
      for (const item of cart) {
        if (item.product_id === productId) {
          productInCart.current = item
          isOrdered.current = true
        } else {
          productInCart.current = null
          isOrdered.current = false
        }
      }
    } else {
      isOrdered.current = false
      productInCart.current = null
    }
  }, [cart, productId,])

  onCheckProduct()

  return { isOrdered: isOrdered.current, productInCart: productInCart.current }
}
