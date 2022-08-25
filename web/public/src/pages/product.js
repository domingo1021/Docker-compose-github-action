function Product(props) {
  const [product, setProduct] = React.useState();
  const [selectedColorCode, setSelectedColorCode] = React.useState();
  const [selectedSize, setSelectedSize] = React.useState();
  const [quantity, setQuantity] = React.useState(1);
  React.useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    api.getProduct(id).then((json) => {
      setSelectedColorCode(json.data.colors[0].code);
      setProduct(json.data);
    });
  }, []);

  if (!product) return null;

  function getStock(colorCode, size) {
    return product.variants.find(
      (variant) => variant.color_code === colorCode && variant.size === size
    ).stock;
  }

  function renderProductColorSelector() {
    return (
      <div className="product__color-selector">
        {product.colors.map((color) => (
          <div
            key={color.code}
            className={`product__color${
              color.code === selectedColorCode
                ? ' product__color--selected'
                : ''
            }`}
            style={{ backgroundColor: `#${color.code}` }}
            onClick={() => {
              setSelectedColorCode(color.code);
              setSelectedSize();
              setQuantity(1);
            }}
          />
        ))}
      </div>
    );
  }

  function renderProductSizeSelector() {
    return (
      <div className="product__size-selector">
        {product.sizes.map((size) => {
          const stock = getStock(selectedColorCode, size);
          return (
            <div
              key={size}
              className={`product__size${
                size === selectedSize ? ' product__size--selected' : ''
              }${stock === 0 ? ' product__size--disabled' : ''}`}
              onClick={() => {
                if (stock === 0) return;
                setSelectedSize(size);
                if (stock < quantity) setQuantity(1);
              }}
            >
              {size}
            </div>
          );
        })}
      </div>
    );
  }

  function renderProductQuantitySelector() {
    return (
      <div className="product__quantity-selector">
        <div
          className="product__quantity-minus"
          onClick={() => {
            if (!selectedSize) return;
            if (quantity === 1) return;
            setQuantity(quantity - 1);
          }}
        />
        <div className="product__quantity-value">{quantity}</div>
        <div
          className="product__quantity-add"
          onClick={() => {
            if (!selectedSize) return;
            const stock = getStock(selectedColorCode, selectedSize);
            if (quantity === stock) return;
            setQuantity(quantity + 1);
          }}
        />
      </div>
    );
  }

  function addToCart() {
    if (!selectedSize) {
      window.alert('請選擇尺寸');
      return;
    }
    const newCartItems = [
      ...props.cartItems,
      {
        color: product.colors.find((color) => color.code === selectedColorCode),
        id: product.id,
        image: product.main_image,
        name: product.title,
        price: product.price,
        qty: quantity,
        size: selectedSize,
        stock: getStock(selectedColorCode, selectedSize),
      },
    ];
    window.localStorage.setItem('cart', JSON.stringify(newCartItems));
    props.setCartItems(newCartItems);
    window.alert('已加入購物車');
  }

  return (
    <div className="product">
      <img src={product.main_image} className="product__main-image" />
      <div className="product__detail">
        <div className="product__title">{product.title}</div>
        <div className="product__id">{product.id}</div>
        <div className="product__price">TWD.{product.price}</div>
        <div className="product__variant">
          <div className="product__color-title">顏色｜</div>
          {renderProductColorSelector()}
        </div>
        <div className="product__variant">
          <div className="product__size-title">尺寸｜</div>
          {renderProductSizeSelector()}
        </div>
        <div className="product__variant">
          <div className="product__quantity-title">數量｜</div>
          {renderProductQuantitySelector()}
        </div>
        <button className="product__add-to-cart-button" onClick={addToCart}>
          {selectedSize ? '加入購物車' : '請選擇尺寸'}
        </button>
        <div className="product__note">{product.note}</div>
        <div className="product__texture">{product.texture}</div>
        <div className="product__description">{product.description}</div>
        <div className="product__place">素材產地 / {product.place}</div>
        <div className="product__place">加工產地 / {product.place}</div>
      </div>
      <div className="product__story">
        <div className="product__story-title">細部說明</div>
        <div className="product__story-content">{product.story}</div>
      </div>
      <div className="product__images">
        {product.images.map((image, index) => (
          <img src={image} className="product__image" key={index} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems, setCartItems] = React.useState(cart);
  return (
    <React.Fragment>
      <Header cartItems={cartItems} />
      <Product cartItems={cartItems} setCartItems={setCartItems} />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
