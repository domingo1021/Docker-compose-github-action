function Header(props) {
  const [inputValue, setInputValue] = React.useState('');
  const category = new URLSearchParams(location.search).get('category');
  return (
    <div className="header">
      <a className="header__logo" href="./index.html" />
      <div className="header__categories">
        <a
          className={`header__category${
            category === 'women' ? ' header__category--active' : ''
          }`}
          href="./index.html?category=women"
        >
          女裝
        </a>
        <a
          className={`header__category${
            category === 'men' ? ' header__category--active' : ''
          }`}
          href="./index.html?category=men"
        >
          男裝
        </a>
        <a
          className={`header__category${
            category === 'accessories' ? ' header__category--active' : ''
          }`}
          href="./index.html?category=accessories"
        >
          配件
        </a>
      </div>
      <input
        className="header__search-input"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            location.href = `./index.html?q=${inputValue}`;
          }
        }}
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
      />
      <div className="header__links">
        <a className="header__link" href="./cart.html">
          <div className="header__link-icon-cart">
            <div className="header__link-icon-cart-number">
              {props.cartItems.length}
            </div>
          </div>
          <div className="header__link-text">購物車</div>
        </a>
        <a className="header__link" href="./profile.html">
          <div className="header__link-icon-profile" />
          <div className="header__link-text">會員</div>
        </a>
      </div>
    </div>
  );
}