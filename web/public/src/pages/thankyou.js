function Thankyou() {
  const number = new URLSearchParams(location.search).get('number');
  return (
    <div className="thankyou">
      <div className="thankyou__title">
        感謝您的購買，我們會盡快將商品送達！
      </div>
      <div className="thankyou__content">
        <div>請記住以下訂單編號，以便查詢</div>
        <div>{number}</div>
        <button
          onClick={() => {
            location.href = './index.html';
          }}
        >
          繼續購物
        </button>
      </div>
    </div>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return (
    <React.Fragment>
      <Header cartItems={cart} />
      <Thankyou />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
