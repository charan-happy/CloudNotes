terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "backend" {
  source = "../modules/s3-backend"

  bucket_name   = "cloudnotes-tf-state"
  dynamodb_table = "cloudnotes-tf-locks"

  tags = {
    Project = "cloudnotes"
  }
}

output "bucket_name" {
  value = module.backend.bucket_name
}

output "dynamodb_table" {
  value = module.backend.dynamodb_table
}