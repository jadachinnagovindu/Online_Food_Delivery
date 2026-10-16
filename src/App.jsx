
import { useEffect, useState } from 'react'
import './App.css'

const BASE_URL = 'http://localhost:9686'

const API = {
  foods: `${BASE_URL}/api/foods/getalldata`,
  customerOrders: name =>
    `${BASE_URL}/api/orders/customer/${encodeURIComponent(name)}`,
  orderItems: `${BASE_URL}/api/order-items/getallorderitems`,
  placeOrder: `${BASE_URL}/api/orders/placeorder`,
  addOrderItem: `${BASE_URL}/api/order-items/addorderitem`,
  cancelOrder: id => `${BASE_URL}/api/orders/cancelorder/${id}`
}

const biryaniImage = '/images/Appetizing%20Chicken%20Biryani%20Bowl.png'

const foodImages = {
  'Chicken Biryani': biryaniImage,
  'Veg Fried Rice':
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=80',
  'Chicken Burger':
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
  'Masala Dosa':
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80',
  'Paneer Pizza':
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
  'French Fries':
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80'
}

function getFoodImage(name) {
  if (name?.trim().toLowerCase() === 'chicken biryani') {
    return biryaniImage
  }

  return foodImages[name] || biryaniImage
}

function FoodImage({ name, className }) {
  const [imageSrc, setImageSrc] = useState(() => getFoodImage(name))

  useEffect(() => {
    setImageSrc(getFoodImage(name))
  }, [name])

  return (
    <img
      className={className}
      src={imageSrc}
      alt={name || 'Food'}
      loading="lazy"
      onError={() => {
        if (imageSrc !== biryaniImage) {
          setImageSrc(biryaniImage)
        }
      }}
    />
  )
}

function App() {
  const [foods, setFoods] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [orderSearchName, setOrderSearchName] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [activePage, setActivePage] = useState('menu')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [foodsLoading, setFoodsLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  )

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  // Load food menu from Spring Boot
  async function loadFoods() {
    setFoodsLoading(true)

    try {
      const response = await fetch(API.foods, { cache: 'no-store' })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Food API did not return a list')
      }

      setFoods(data)
      setMessage('')
    } catch (error) {
      console.error('Error loading foods:', error)
      setMessage(`Food menu load avvaledu: ${error.message}`)
    } finally {
      setFoodsLoading(false)
    }
  }

  useEffect(() => {
    loadFoods()
  }, [])

  async function loadOrders(name = orderSearchName) {
    const customer = name.trim()

    if (!customer) {
      setOrders([])
      setMessage('Please enter your customer name first.')
      return
    }

    setOrdersLoading(true)
    setMessage('')

    try {
      const response = await fetch(API.customerOrders(customer), {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()
      const result = Array.isArray(data) ? data : []

      setOrders(result)
      setOrderSearchName(customer)

      if (result.length === 0) {
        setMessage(`No orders found for "${customer}".`)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setMessage(`Could not load orders. ${error.message}`)
    } finally {
      setOrdersLoading(false)
    }
  }

  async function refreshOrders() {
    if (!orderSearchName.trim()) {
      setMessage('Enter a customer name to refresh orders.')
      return
    }

    setSelectedOrderId(null)
    setOrderItems([])
    await loadOrders(orderSearchName)
  }

  async function viewOrderDetails(orderId) {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null)
      setOrderItems([])
      return
    }

    setSelectedOrderId(orderId)
    setDetailsLoading(true)
    setOrderItems([])
    setMessage('')

    try {
      const response = await fetch(API.orderItems, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()

      const matchingItems = Array.isArray(data)
        ? data.filter(
            item => Number(item.order?.id) === Number(orderId)
          )
        : []

      setOrderItems(matchingItems)
    } catch (error) {
      console.error('Error loading order details:', error)
      setSelectedOrderId(null)
      setMessage(`Could not load order details. ${error.message}`)
    } finally {
      setDetailsLoading(false)
    }
  }

  function addToCart(food) {
    setMessage('')

    setCart(previous => {
      const found = previous.find(item => item.id === food.id)

      if (found) {
        return previous.map(item =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...previous, { ...food, quantity: 1 }]
    })

    setMessage(`${food.name} added to cart.`)
  }

  function changeQuantity(id, amount) {
    setCart(previous =>
      previous
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  async function placeOrder() {
    const name = customerName
      .trim()
      .toLowerCase()
      .replace(/\b[a-z]/g, letter => letter.toUpperCase())

    if (!name) {
      setMessage('Please enter your name.')
      return
    }

    if (cart.length === 0) {
      setMessage('Your cart is empty.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(API.placeOrder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          orderDate: new Date().toISOString().slice(0, 19),
          totalAmount: total,
          status: 'PLACED'
        })
      })

      if (!response.ok) {
        throw new Error(`Could not place order: ${response.status}`)
      }

      const order = await response.json()

      for (const item of cart) {
        const itemResponse = await fetch(API.addOrderItem, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: { id: order.id },
            foodItem: { id: item.id },
            quantity: item.quantity,
            price: item.price
          })
        })

        if (!itemResponse.ok) {
          throw new Error(
            `Order ${order.id} created, but an item failed to save.`
          )
        }
      }

      setCart([])
      setCustomerName('')
      setOrderSearchName(name)
      setSelectedOrderId(null)
      setOrderItems([])
      setActivePage('orders')

      await loadOrders(name)

      setMessage(`Order placed successfully! Order ID: ${order.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function cancelOrder(orderId) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${orderId}?`
    )

    if (!confirmed) return

    setMessage('')

    try {
      const response = await fetch(API.cancelOrder(orderId), {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error(`Could not cancel order: ${response.status}`)
      }

      setSelectedOrderId(null)
      setOrderItems([])

      await loadOrders(orderSearchName)
      setMessage(`Order #${orderId} cancelled successfully.`)
    } catch (error) {
      console.error('Error cancelling order:', error)
      setMessage(`Cancellation failed. ${error.message}`)
    }
  }

  function openPage(page) {
    setActivePage(page)
    setMessage('')

    if (page === 'orders' && orderSearchName.trim()) {
      loadOrders(orderSearchName)
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <button className="brand" onClick={() => openPage('menu')}>
          🍽️ Food<span>Delivery</span>
        </button>

        <nav>
          <button
            className={activePage === 'menu' ? 'nav-link active' : 'nav-link'}
            onClick={() => openPage('menu')}
          >
            Menu
          </button>

          <button
            className={activePage === 'cart' ? 'nav-link active' : 'nav-link'}
            onClick={() => openPage('cart')}
          >
            Cart <span className="cart-count">{cartCount}</span>
          </button>

          <button
            className={activePage === 'orders' ? 'nav-link active' : 'nav-link'}
            onClick={() => openPage('orders')}
          >
            My Orders
          </button>
        </nav>
      </header>

      {message && (
        <div className="message" role="status">
          {message}
          <button onClick={() => setMessage('')} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <main className="main-content">
        {activePage === 'menu' && (
          <>
            <section className="hero">
              <p className="eyebrow">FRESH • TASTY • DELIVERED</p>
              <h1>Discover delicious food</h1>
              <p>Your favourite meals, all in one place.</p>
            </section>

            <div className="section-heading">
              <div>
                <h2>Our Menu</h2>
                <p>Choose something delicious today.</p>
              </div>

              <span>{foods.length} items</span>
            </div>

            {foodsLoading ? (
              <div className="empty-state">
                <h2>Loading food menu...</h2>
                <p>Please wait while we connect to the server.</p>
              </div>
            ) : foods.length === 0 ? (
              <div className="empty-state">
                <h2>No food items found</h2>
                <p>Check the backend API and database, then try again.</p>
                <button onClick={loadFoods}>Retry</button>
              </div>
            ) : (
              <div className="food-grid">
                {foods.map(food => (
                  <article className="food-card" key={food.id}>
                    <div className="food-image-container">
                      <FoodImage
                        className="food-image"
                        name={food.name}
                      />
                    </div>

                    <div className="food-info">
                      <span
                        className={
                          food.available ? 'availability' : 'unavailable'
                        }
                      >
                        {food.available ? '● Available' : '● Unavailable'}
                      </span>

                      <h3>{food.name}</h3>
                      <p>{food.description}</p>

                      <div className="food-footer">
                        <strong>₹{food.price}</strong>

                        <button
                          disabled={food.available === false || loading}
                          onClick={() => addToCart(food)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {activePage === 'cart' && (
          <section className="page-section">
            <h1>Your Shopping Cart</h1>
            <p>Review your items before placing the order.</p>

            {cart.length === 0 ? (
              <div className="empty-state">
                <div>🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add food from our menu to get started.</p>
                <button onClick={() => openPage('menu')}>Explore Menu</button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-items">
                  {cart.map(item => (
                    <article className="cart-row" key={item.id}>
                      <FoodImage
                        className="cart-food-image"
                        name={item.name}
                      />

                      <div className="cart-food-info">
                        <h3>{item.name}</h3>
                        <p>₹{item.price} per item</p>
                      </div>

                      <div className="quantity">
                        <button
                          disabled={loading}
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          disabled={loading}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>

                      <strong>
                        ₹{Number(item.price) * item.quantity}
                      </strong>
                    </article>
                  ))}
                </div>

                <aside className="checkout-card">
                  <h2>Order Summary</h2>

                  <div className="summary-line">
                    <span>Items</span>
                    <span>{cartCount}</span>
                  </div>

                  <div className="summary-line total-line">
                    <span>Total</span>
                    <strong>₹{total.toFixed(2)}</strong>
                  </div>

                  <label htmlFor="customerName">Your name</label>

                  <input
                    id="customerName"
                    value={customerName}
                    onChange={event => setCustomerName(event.target.value)}
                    placeholder="Enter your name"
                    disabled={loading}
                  />

                  <button
                    className="primary-button full-button"
                    onClick={placeOrder}
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </aside>
              </div>
            )}
          </section>
        )}

        {activePage === 'orders' && (
          <section className="page-section">
            <div className="section-heading">
              <div>
                <h1>My Orders</h1>
                <p>Find orders and view their details.</p>
              </div>

              <button
                className="refresh-button"
                disabled={ordersLoading}
                onClick={refreshOrders}
              >
                {ordersLoading ? 'Loading...' : '↻ Refresh'}
              </button>
            </div>

            <div className="orders-search">
              <label htmlFor="ordersCustomerName">Customer name</label>

              <input
                id="ordersCustomerName"
                value={orderSearchName}
                onChange={event => setOrderSearchName(event.target.value)}
                placeholder="Enter the name used for your order"
                onKeyDown={event => {
                  if (event.key === 'Enter') loadOrders(orderSearchName)
                }}
              />

              <button
                disabled={ordersLoading}
                onClick={() => loadOrders(orderSearchName)}
              >
                {ordersLoading ? 'Searching...' : 'Find My Orders'}
              </button>
            </div>

            {ordersLoading ? (
              <div className="empty-state">
                <h2>Loading orders...</h2>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div>📦</div>
                <h2>No orders to display</h2>
                <p>
                  Enter the customer name used during checkout and click
                  Find My Orders.
                </p>
                <button onClick={() => openPage('menu')}>Browse Menu</button>
              </div>
            ) : (
              <div className="orders-list">
                {[...orders].reverse().map(order => (
                  <article className="order-card" key={order.id}>
                    <div className="order-top">
                      <div>
                        <span className="order-label">ORDER</span>
                        <h3>#{order.id}</h3>
                      </div>

                      <span
                        className={`status ${String(order.status || '')
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="order-details">
                      <p>
                        <span>Customer</span>
                        <strong>{order.customerName}</strong>
                      </p>

                      <p>
                        <span>Order date</span>
                        <strong>
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleString()
                            : 'N/A'}
                        </strong>
                      </p>
                    </div>

                    <div className="order-total">
                      <span>Total Amount</span>
                      <strong>₹{order.totalAmount}</strong>
                    </div>

                    <div className="order-actions">
                      <button
                        className="view-details-button"
                        disabled={detailsLoading}
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        {detailsLoading && selectedOrderId === order.id
                          ? 'Loading Details...'
                          : selectedOrderId === order.id
                            ? 'Hide Details'
                            : 'View Details'}
                      </button>

                      {String(order.status).toUpperCase() !== 'CANCELLED' && (
                        <button
                          className="cancel-order-button"
                          onClick={() => cancelOrder(order.id)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                    {selectedOrderId === order.id && (
                      <div className="order-items-details">
                        <h4>Items in Order #{order.id}</h4>

                        {detailsLoading ? (
                          <p>Loading order items...</p>
                        ) : orderItems.length === 0 ? (
                          <p>No items found for this order.</p>
                        ) : (
                          <>
                            {orderItems.map((item, index) => {
                              const foodName =
                                item.foodItem?.name || 'Food item'
                              const quantity = Number(item.quantity || 0)
                              const price = Number(item.price || 0)

                              return (
                                <div
                                  className="order-item-row"
                                  key={item.id ?? `${order.id}-${index}`}
                                >
                                  <div>
                                    <strong>{foodName}</strong>
                                    <p>
                                      ₹{price} × {quantity}
                                    </p>
                                  </div>

                                  <strong>
                                    ₹{(price * quantity).toFixed(2)}
                                  </strong>
                                </div>
                              )
                            })}

                            <div className="details-total">
                              <span>Order Total</span>
                              <strong>
                                ₹{Number(order.totalAmount || 0).toFixed(2)}
                              </strong>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer>
        <p>🍽️ Food Delivery · Made with care</p>
      </footer>
    </div>
  )
}

export default App
