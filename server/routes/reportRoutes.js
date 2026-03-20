import { parseCreateReportRequest } from '../validators/reportSchemas.js';

export function createReportHandler({ reportService }) {
  if (!reportService) {
    throw new Error('[ReportRoute] 缺少 reportService 依赖');
  }

  return async (request, response, next) => {
    try {
      const input = parseCreateReportRequest(request.body);
      const result = await reportService.createReport(input);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export function registerReportRoutes(app, services = {}) {
  if (!services.reportService) {
    return;
  }

  app.post(
    '/api/report/create',
    createReportHandler({
      reportService: services.reportService
    })
  );
}
