import Main from 'components/UI/Main/Main'
import SEO from 'components/SEO'

const mockCategories = [
  {
    title: { uz: 'your category', ru: 'your category', en: 'your category' },
    products: [
      {
        title: { uz: 'your product', ru: 'your product', en: 'your product' },
        description: { uz: 'your product description', ru: 'your product description', en: 'your product description' },
        out_price: 1000,
        product_id: 'your_product_id',
        type: 'simple'
      },
      {
        title: { uz: 'your product', ru: 'your product', en: 'your product' },
        description: { uz: 'your product description', ru: 'your product description', en: 'your product description' },
        out_price: 1000,
        product_id: 'your_product_id_2',
        type: 'combo',
      },
      {
        title: { uz: 'your product', ru: 'your product', en: 'your product' },
        description: { uz: 'your product description', ru: 'your product description', en: 'your product description' },
        out_price: 1000,
        product_id: 'your_product_id_3',
        type: 'origin'
      }
    ]
  }
]

export default function Home({ banners = [{ image: '/images/bot_logo.png', id: 1 }, { image: '/images/bot_logo.png', id: 2 }],
  categories = mockCategories, popups = [] }) {
  return (
    <>
      <SEO />
      <Main banners={banners} categories={categories} popups={popups} />
    </>
  )
}
