# content-studio · 部署文件

服务器上 root 用户的部署模板。

## 安装步骤

```bash
# 1. 拉最新代码
cd /root/content-studio
git pull

# 2. 装 systemd 服务
sudo cp deploy/content-studio-api.service /etc/systemd/system/

# 3. nginx (首次)
sudo cp deploy/nginx-studio.conf /etc/nginx/conf.d/studio.conf
sudo nginx -t && sudo systemctl reload nginx

# 4. 启用 + 启动
sudo systemctl daemon-reload
sudo systemctl enable content-studio-api
sudo systemctl start content-studio-api

# 5. 查状态
sudo systemctl status content-studio-api --no-pager
```

## 更新流程

```bash
cd /root/content-studio
git pull
npm install
npm run build
cp -r dist/* /var/www/studio/
sudo systemctl restart content-studio-api
```

## 路径约定

| 项 | 路径 |
|---|---|
| 代码 | `/root/content-studio/` |
| 静态产物 | `/var/www/studio/`(nginx 提供) |
| Express 后端 | `127.0.0.1:5174`(内部,nginx 反代) |
| 日志 | `/root/content-studio/api.log` + `journalctl -u content-studio-api` |
| 配置 | `/root/content-studio/.env`(不在 git 里) |

## 端口

- 8080:nginx 对外(阿里云安全组须放行)
- 5174:Express 内部
- 8001:we-mp-rss 内部
