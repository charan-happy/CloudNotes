variable "bucket_name" {
  description = "S3 bucket name for Terraform state"
  type        = string
}

variable "dynamodb_table" {
  description = "DynamoDB table for state locking"
  type        = string
  default     = "cloudnotes-tf-locks"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}