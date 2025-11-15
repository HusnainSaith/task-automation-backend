import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards';
import { ProblemsService } from './problems.service';
import { ReportProblemDto } from './dto/report-problem.dto';

@Controller('problems')
@UseGuards(JwtAuthGuard)
export class ProblemsController {
  constructor(private problemsService: ProblemsService) {}

  @Post('report')
  async reportProblem(
    @Body() reportProblemDto: ReportProblemDto,
    @Request() req
  ) {
    return this.problemsService.reportProblem(
      req.user.userId,
      reportProblemDto,
      req.user.companyId
    );
  }
}