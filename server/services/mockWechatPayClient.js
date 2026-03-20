export function createMockWechatPayClient({ logger }) {
  return {
    paymentBackend: 'mock',

    async createJsapiOrder({ amountFen, description, outTradeNo }) {
      logger?.info?.(
        {
          outTradeNo,
          amountFen,
          description
        },
        '[Payment] 创建 mock 支付订单'
      );

      return {
        paymentBackend: 'mock',
        paymentParams: {
          mockOrderId: outTradeNo,
          mockLabel: '开发联调支付'
        }
      };
    }
  };
}
