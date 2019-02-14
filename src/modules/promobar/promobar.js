import promobar from 'promobar'

export default el => {
  const promo = promobar(el)

  setTimeout(promo.show, 4000)

  window.promobar = promo
}
