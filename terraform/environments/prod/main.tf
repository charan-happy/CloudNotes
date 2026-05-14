terraform {
  backend "s3" {
    bucket         = "cloudnotes-tf-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "cloudnotes-tf-locks"
  }
}

module "cloudnotes" {
  source = "../.."

  project     = "cloudnotes"
  environment = "prod"
  region      = "us-east-1"

  vpc_cidr = "10.2.0.0/16"

  cluster_version = "1.29"

  node_instance_types = ["t3.medium", "t3.large"]
  node_desired_size    = 3
  node_max_size        = 6
  node_min_size        = 3

  domain_name            = "cloudnotes.app"
  create_acm_certificate = true

  enable_monitoring = true

  tags = {
    Environment = "prod"
    CostCenter   = "cloudnotes-prod"
    Compliance   = "HIPAA"
  }
}