export class ApiResponse<T = any> {
  constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly data?: T
  ) {}
}
