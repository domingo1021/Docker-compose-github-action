function Carousel() {
  const [campaigns, setCampaigns] = React.useState([]);
  const [activeCampaignIndex, setActiveCampaignIndex] = React.useState(0);
  const intervalRef = React.useRef();
  React.useEffect(() => {
    api.getCampaigns().then((json) => {
      setCampaigns(json.data);
      intervalRef.current = window.setInterval(() => {
        setActiveCampaignIndex((prev) =>
          prev === json.data.length - 1 ? 0 : prev + 1
        );
      }, 5000);
    });
  }, []);
  return (
    <div className="carousel">
      {campaigns.map((campaign, index) => (
        <a
          className={`carousel__campaign${
            index === activeCampaignIndex ? ' carousel__campaign--active' : ''
          }`}
          style={{
            backgroundImage: `url(${campaign.picture})`,
          }}
          key={campaign.id}
          href={`./product.html?id=${campaign.product_id}`}
        >
          <div className="carousel__campaign-story">
            <div className="carousel__campaign-story-content">
              {campaign.story.split('\r\n').slice(0, 3).join('\r\n')}
            </div>
            <div className="carousel__campaign-story-title">
              {campaign.story.split('\r\n')[3]}
            </div>
          </div>
        </a>
      ))}
      <div className="carousel__dots">
        {campaigns.map((campaign, index) => (
          <div
            className={`carousel__dot${
              index === activeCampaignIndex ? ' carousel__dot--active' : ''
            }`}
            key={campaign.id}
            onClick={() => {
              setActiveCampaignIndex(index);
              window.clearInterval(intervalRef.current);
              intervalRef.current = window.setInterval(() => {
                setActiveCampaignIndex((prev) =>
                  prev === campaigns.length - 1 ? 0 : prev + 1
                );
              }, 5000);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = React.useState([]);
  const nextPagingRef = React.useRef(0);
  React.useEffect(() => {
    let isFetching = false;

    const intersectionObserver = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio <= 0) return;

      if (nextPagingRef.current === undefined) return;

      if (isFetching) return;

      const q = new URLSearchParams(location.search).get('q');
      const category = new URLSearchParams(location.search).get('category');

      function fetchProducts() {
        if (q) {
          return api.searchProducts(q, nextPagingRef.current);
        }
        if (category) {
          return api.getProducts(category, nextPagingRef.current);
        }
        return api.getProducts('all', nextPagingRef.current);
      }

      isFetching = true;

      fetchProducts().then((json) => {
        setProducts((prev) => [...prev, ...json.data]);
        nextPagingRef.current = json.next_paging;
        isFetching = false;
      });
    });
    intersectionObserver.observe(document.querySelector('.waypoint'));
  }, []);
  return (
    <React.Fragment>
      <div className="products">
        {products.map((product) => (
          <a
            className="product"
            key={product.id}
            href={`./product.html?id=${product.id}`}
          >
            <img src={product.main_image} className="product__image" />
            <div className="product__colors">
              {product.colors.map((color) => (
                <div
                  className="product__color"
                  style={{ backgroundColor: `#${color.code}` }}
                  key={color.code}
                />
              ))}
            </div>
            <div className="product__title">{product.title}</div>
            <div className="product__price">TWD.{product.price}</div>
          </a>
        ))}
      </div>
      <div className="waypoint"></div>
    </React.Fragment>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return (
    <React.Fragment>
      <Header cartItems={cart} />
      <Carousel />
      <Products />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
