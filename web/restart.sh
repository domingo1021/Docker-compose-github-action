npm install
sudo service mysqld start
sudo service nginx start
sudo service redis start
pm2 stop stylish
pm2 start app.js --name stylish
