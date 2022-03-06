import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report-dto';
import { Report } from './report.entity';
import { GetEstimateDto } from './dto/get-estimate-dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  createEstimate(estimateDto: GetEstimateDto) {
    return (
      this.repo
        .createQueryBuilder()
        // .select('AVG(price)', 'price')
        .select('*')
        .where('make = :make', { make: estimateDto.make })
        .andWhere('model = :model', { model: estimateDto.model })
        .andWhere('lng - :lng BETWEEN -5 and 5', { lng: estimateDto.lng })
        .andWhere('lat - :lat BETWEEN -5 and 5', { lat: estimateDto.lat })
        .andWhere('year - :year BETWEEN -3 and 3', { year: estimateDto.year })
        // .orderBy('ABS(mileage - :mileage)', 'DESC')
        // .setParameters({ mileage: estimateDto.mileage })
        // .limit(3)
        .getRawMany()
    );
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne(id);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.approved = approved;
    return this.repo.save(report);
  }
}
