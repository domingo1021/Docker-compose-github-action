function Cart(props) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [time, setTime] = React.useState();

  React.useEffect(() => {
    TPDirect.setupSDK(
      '12348',
      'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF',
      'sandbox'
    );
    TPDirect.card.setup({
      fields: {
        number: {
          element: '#card-number',
          placeholder: '**** **** **** ****',
        },
        expirationDate: {
          element: '#card-expiration-date',
          placeholder: 'MM / YY',
        },
        ccv: {
          element: '#card-ccv',
          placeholder: '後三碼',
        },
      },
      styles: {
        '.valid': {
          color: 'green',
        },
        '.invalid': {
          color: 'red',
        },
      },
    });
  }, []);

  function changeQuantity(itemIndex, itemQuantity) {
    const newCartItems = props.cartItems.map((item, index) =>
      index === itemIndex
        ? {
            ...item,
            qty: itemQuantity,
          }
        : item
    );
    props.setCartItems(newCartItems);
    window.localStorage.setItem('cart', JSON.stringify(newCartItems));
    window.alert('已修改數量');
  }

  function deleteItem(itemIndex) {
    const newCartItems = props.cartItems.filter(
      (_, index) => index !== itemIndex
    );
    props.setCartItems(newCartItems);
    window.localStorage.setItem('cart', JSON.stringify(newCartItems));
    window.alert('已刪除商品');
  }

  const subtotal = props.cartItems.reduce(
    (prev, item) => prev + item.price * item.qty,
    0
  );

  const freight = 30;

  function checkout() {
    const jwtToken = window.localStorage.getItem('jwtToken');

    if (!jwtToken) {
      window.alert('請先登入');
      fb.loadScript()
        .then(() => fb.init())
        .then(() => fb.getLoginStatus())
        .then((response) => {
          if (response.status === 'connected') {
            return Promise.resolve(response.authResponse.accessToken);
          }
          return fb.login().then((response) => {
            if (response.status === 'connected') {
              return Promise.resolve(response.authResponse.accessToken);
            }
            return Promise.reject('登入失敗');
          });
        })
        .then((accessToken) =>
          api.signin({
            provider: 'facebook',
            access_token: accessToken,
          })
        )
        .then((json) => {
          window.localStorage.setItem('jwtToken', json.data.access_token);
          checkout();
        })
        .catch((error) => window.alert(error));
      return;
    }

    if (props.cartItems.length === 0) {
      window.alert('尚未選購商品');
      return;
    }

    const recipient = {
      name,
      phone,
      email,
      address,
      time,
    };

    if (Object.values(recipient).some((value) => !value)) {
      window.alert('請填寫完整訂購資料');
      return;
    }

    if (!TPDirect.card.getTappayFieldsStatus().canGetPrime) {
      window.alert('付款資料輸入有誤');
      return;
    }

    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        window.alert('付款資料輸入有誤');
        return;
      }

      api
        .checkout(
          {
            prime: result.card.prime,
            order: {
              shipping: 'delivery',
              payment: 'credit_card',
              subtotal,
              freight,
              total: subtotal + freight,
              recipient,
              list: props.cartItems,
            },
          },
          jwtToken
        )
        .then((json) => {
          window.alert('付款成功');
          window.localStorage.setItem('cart', JSON.stringify([]));
          location.href = `./thankyou.html?number=${json.data.number}`;
        });
    });
  }

  return (
    <div className="cart">
      <div className="cart__header">
        <div className="cart__header-number">
          購物車({props.cartItems.length})
        </div>
        <div className="cart__header-quantity">數量</div>
        <div className="cart__header-price">單價</div>
        <div className="cart__header-subtotal">小計</div>
        <div className="cart__header-delete-button" />
      </div>
      <div className="cart__items">
        {props.cartItems.map((item, index) => (
          <div className="cart__item" key={index}>
            <img src={item.image} className="cart__item-image" />
            <div className="cart__item-detail">
              <div className="cart__item-name">{item.name}</div>
              <div className="cart__item-id">{item.id}</div>
              <div className="cart__item-color">顏色｜{item.color.name}</div>
              <div className="cart__item-size">尺寸｜{item.size}</div>
            </div>
            <div className="cart__item-quantity">
              <div className="cart__item-quantity-title">數量</div>
              <select
                value={item.qty}
                className="cart__item-quantity-selector"
                onChange={(e) => changeQuantity(index, e.target.value)}
              >
                {Array(item.stock)
                  .fill()
                  .map((_, index) => (
                    <option key={index}>{index + 1}</option>
                  ))}
              </select>
            </div>
            <div className="cart__item-price">
              <div className="cart__item-price-title">單價</div>
              <div className="cart__item-price-content">NT.{item.price}</div>
            </div>
            <div className="cart__item-subtotal">
              <div className="cart__item-subtotal-title">小計</div>
              <div className="cart__item-subtotal-content">
                NT.{item.qty * item.price}
              </div>
            </div>
            <div
              className="cart__delete-button"
              onClick={() => deleteItem(index)}
            />
          </div>
        ))}
      </div>
      <div className="shipment">
        <div className="shipment__item-name">配送國家</div>
        <select className="shipment__item-selector" defaultValue="taiwan">
          <option value="taiwan">臺灣及離島</option>
        </select>
        <div className="shipment__item-name">付款方式</div>
        <select className="shipment__item-selector" defaultValue="credit_card">
          <option value="credit_card">信用卡付款</option>
        </select>
      </div>
      <div className="note">
        ※ 提醒您：
        <br />● 選擇宅配-請填寫正確收件人資訊，避免包裹配送不達
        <br />● 選擇超商-請填寫正確收件人姓名(與證件相符)，避免無法領取
      </div>
      <div className="form">
        <div className="form__title">訂購資料</div>
        <div className="form__field">
          <div className="form__field-name">收件人姓名</div>
          <input
            className="form__field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form__note">
          務必填寫完整收件人姓名，避免包裹無法順利簽收
        </div>
        <div className="form__field">
          <div className="form__field-name">Email</div>
          <input
            className="form__field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form__field">
          <div className="form__field-name">手機</div>
          <input
            className="form__field-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form__field">
          <div className="form__field-name">地址</div>
          <input
            className="form__field-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="form__field">
          <div className="form__field-name">配送時間</div>
          <div className="form__field-radios">
            <label className="form__field-radio">
              <input
                type="radio"
                checked={time === 'morning'}
                onChange={(e) => {
                  if (e.target.checked) setTime('morning');
                }}
              />{' '}
              08:00-12:00
            </label>
            <label className="form__field-radio">
              <input
                type="radio"
                checked={time === 'afternoon'}
                onChange={(e) => {
                  if (e.target.checked) setTime('afternoon');
                }}
              />{' '}
              14:00-18:00
            </label>
            <label className="form__field-radio">
              <input
                type="radio"
                checked={time === 'anytime'}
                onChange={(e) => {
                  if (e.target.checked) setTime('anytime');
                }}
              />{' '}
              不指定
            </label>
          </div>
        </div>
      </div>
      <div className="form">
        <div className="form__title">付款資料</div>
        <div className="form__field">
          <div className="form__field-name">信用卡號碼</div>
          <div className="form__field-input" id="card-number" />
        </div>
        <div className="form__field">
          <div className="form__field-name">有效期限</div>
          <div className="form__field-input" id="card-expiration-date" />
        </div>
        <div className="form__field">
          <div className="form__field-name">安全碼</div>
          <div className="form__field-input" id="card-ccv" />
        </div>
      </div>
      <div className="total">
        <div className="total__name">總金額</div>
        <div className="total__nt">NT.</div>
        <div className="total__amount">{subtotal}</div>
      </div>
      <div className="freight">
        <div className="freight__name">運費</div>
        <div className="total__nt">NT.</div>
        <div className="total__amount">{freight}</div>
      </div>
      <div className="payable">
        <div className="payable__name">應付金額</div>
        <div className="total__nt">NT.</div>
        <div className="total__amount">{subtotal + freight}</div>
      </div>
      <button className="checkout-button" onClick={checkout}>
        確認付款
      </button>
    </div>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems, setCartItems] = React.useState(cart);
  return (
    <React.Fragment>
      <Header cartItems={cartItems} />
      <Cart cartItems={cartItems} setCartItems={setCartItems} />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
