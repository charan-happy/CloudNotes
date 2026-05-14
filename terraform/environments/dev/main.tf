terraform {
  backend "s3" {
    bucket         = "cloudnotes-tf-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "cloudnotes-tf-locks"
  }
}

module "cloudnotes" {
  source = "../.."

  project     = "cloudnotes"
  environment = "dev"
  region      = "us-east-1"

  vpc_cidr = "10.0.0.0/16"

  cluster_version = "1.29"

  node_instance_types = ["t3.small"]
  node_desired_size    = 1
  node_max_size        = 2
  node_min_size        = 1

  enable_monitoring = false

  tags = {
    Environment = "dev"
    CostCenter   = "cloudnotes-dev"
  }
}