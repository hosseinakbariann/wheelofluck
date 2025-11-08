import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';


export class CreatePrizeDTO{
  @IsNotEmpty()
  @IsString()
  key!:string;

  @IsNotEmpty()
  @IsString()
  title!:string;

  @IsNumber()
  @IsPositive()
  payload!: object;

  @IsNumber()
  @IsPositive()
  weight!:number;

  @IsBoolean()
  singleClaim?:boolean;
}

export class UpdatePrizeDTO{
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  key?:string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?:string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  payload?: object;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  weight?:number;

  @IsOptional()
  @IsBoolean()
  singleClaim?:boolean;
}