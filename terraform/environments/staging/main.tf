terraform {
  backend "s3" {
    bucket         = "cloudnotes-tf-state"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "cloudnotes-tf-locks"
  }
}

module "cloudnotes" {
  source = "../.."

  project     = "cloudnotes"
  environment = "staging"
  region      = "us-east-1"

  vpc_cidr = "10.1.0.0/16"

  cluster_version = "1.29"

  node_instance_types = ["t3.medium"]
  node_desired_size    = 2
  node_max_size        = 4
  node_min_size        = 2

  domain_name            = "staging.cloudnotes.dev"
  create_acm_certificate = true

  enable_monitoring = true

  tags = {
    Environment = "staging"
    CostCenter   = "cloudnotes-staging"
  }
}