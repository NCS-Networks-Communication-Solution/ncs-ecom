export class ErrorResponseDto {
  code!: string;
  message!: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
