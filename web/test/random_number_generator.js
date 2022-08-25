function beta_trans(n) {
    return Math.sin((n*Math.PI)/2) ** 2;
}

function beta_left_trans(n) {
    let beta = beta_trans(n);
    return (beta < 0.5) ? 2*beta : 2*(1-beta);
}

function beta_right_trans(n) {
    let beta = beta_trans(n);
    return (beta > 0.5) ? 2*beta-1 : 2*(1-beta)-1;
}

function Generator(range, beta_func) {
    if (beta_func == undefined) {
        beta_func = beta_trans;
    }
    this.range = range;
    this.generate = () => {
        let unif = Math.random();
        let number = Math.floor(beta_func(unif)*this.range);
        return number;
    };
}

module.exports = {
    beta_trans,
    beta_left_trans,
    beta_right_trans,
    Generator
};