import { randomUUID } from 'crypto';

function ensureWechatConfig(env) {
  if (!env.wechatAppId || !env.wechatMchId || !env.wechatNotifyUrl) {
    throw new Error('[Payment] 微信支付基础配置不完整');
  }
}

export function createWechatPayClient({ env, httpTransport, logger, signer }) {
  ensureWechatConfig(env);

  return {
    async createJsapiOrder({ amountFen, description, outTradeNo, payerOpenId }) {
      if (!httpTransport || !signer) {
        throw new Error('[Payment] 微信支付签名传输层尚未配置');
      }

      const response = await httpTransport.post('/v3/pay/transactions/jsapi', {
        appid: env.wechatAppId,
        mchid: env.wechatMchId,
        description,
        out_trade_no: outTradeNo,
        notify_url: env.wechatNotifyUrl,
        amount: {
          total: amountFen,
          currency: 'CNY'
        },
        payer: {
          openid: payerOpenId
        }
      });

      const prepayId = response.prepay_id;

      if (!prepayId) {
        throw new Error('[Payment] 微信支付未返回 prepay_id');
      }

      const nonceStr = randomUUID().replace(/-/g, '');
      const timeStamp = `${Math.floor(Date.now() / 1000)}`;
      const packageValue = `prepay_id=${prepayId}`;
      const paySign = await signer.sign([
        env.wechatAppId,
        timeStamp,
        nonceStr,
        packageValue
      ].join('\n') + '\n');

      logger?.info?.(
        {
          outTradeNo,
          prepayId
        },
        '[Payment] 生成微信支付调起参数成功'
      );

      return {
        prepayId,
        paymentParams: {
          appId: env.wechatAppId,
          timeStamp,
          nonceStr,
          package: packageValue,
          signType: 'RSA',
          paySign
        }
      };
    }
  };
}
