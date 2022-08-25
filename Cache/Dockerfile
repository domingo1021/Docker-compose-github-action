FROM redis

RUN mkdir -p /var/lib/redis/ \
&& mkdir -p  /var/log/redis/ \
&& mkdir -p /usr/local/etc/redis/\
&& touch /var/log/redis/log.log\
&& chmod 777 /var/lib/redis \
&& chmod 777 /var/log/redis/log.log

COPY redis.conf /usr/local/etc/redis/redis.conf

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
