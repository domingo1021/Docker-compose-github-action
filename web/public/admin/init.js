fb.loadScript()
  .then(() => fb.init())
  .then(() => {
    window.fb = {
      jwtToken: undefined,
      login() {
        fb.login()
          .then((response) => {
            if (response.status === 'connected') {
              return api.signin({
                provider: 'facebook',
                access_token: response.authResponse.accessToken,
              });
            }
            return Promise.reject();
          })
          .then((json) => {
            this.jwtToken = json.data.access_token;
          });
      },
    };
  });
