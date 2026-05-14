module "vpc" {
  source = "./modules/vpc"

  project          = var.project
  environment      = var.environment
  region           = var.region
  vpc_cidr         = var.vpc_cidr

  tags = var.tags
}

module "eks" {
  source = "./modules/eks"

  project     = var.project
  environment = var.environment
  cluster_version = var.cluster_version

  subnet_ids = concat(module.vpc.private_subnet_ids, module.vpc.public_subnet_ids)

  endpoint_private_access = true
  endpoint_public_access  = true

  desired_size = var.node_desired_size
  max_size     = var.node_max_size
  min_size     = var.node_min_size
  instance_types = var.node_instance_types

  tags = var.tags

  depends_on = [module.vpc]
}

module "rds" {
  source = "./modules/rds"

  project     = var.project
  environment = var.environment

  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids

  enable_postgresql = true
  enable_mysql      = true
  enable_mongodb    = true

  postgresql_db_name = "cloudnotes"
  mysql_db_name      = "cloudnotes_users"
  mongodb_db_name    = "cloudnotes_notes"

  multi_az            = var.environment == "prod"
  backup_retention    = var.environment == "prod" ? 30 : 7

  skip_final_snapshot = var.environment == "dev"

  tags = var.tags

  depends_on = [module.vpc]
}

module "networking" {
  source = "./modules/networking"

  project     = var.project
  environment = var.environment

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids

  create_acm_certificate = var.create_acm_certificate
  domain_name            = var.domain_name

  enable_deletion_protection = var.environment == "prod"

  tags = var.tags

  depends_on = [module.vpc]
}

module "secrets" {
  source = "./modules/secrets"

  project     = var.project
  environment = var.environment

  create_app_secret = true
  create_jwt_secret = true

  jwt_secret_key  = var.environment != "prod" ? "dev-secret-key-change-in-production" : ""
  jwt_token_expiry = 24

  tags = var.tags
}

resource "aws_s3_bucket" "app_storage" {
  count = var.environment != "dev" ? 1 : 0

  bucket = "${var.project}-${var.environment}-storage-${data.aws_caller_identity.current.account_id}"

  tags = var.tags
}

resource "aws_s3_bucket_versioning" "app_storage" {
  count = var.environment != "dev" ? 1 : 0

  bucket = aws_s3_bucket.app_storage[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_storage" {
  count = var.environment != "dev" ? 1 : 0

  bucket = aws_s3_bucket.app_storage[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage" {
  count = var.environment != "dev" ? 1 : 0

  bucket = aws_s3_bucket.app_storage[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_kms_key" "s3_encryption" {
  count = var.environment != "dev" ? 1 : 0

  description             = "KMS key for S3 bucket encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = var.tags
}

resource "aws_kms_alias" "s3_encryption" {
  count = var.environment != "dev" ? 1 : 0

  name          = "alias/${var.project}-s3-${var.environment}"
  target_key_id = aws_kms_key.s3_encryption[0].key_id
}

data "aws_caller_identity" "current" {}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_postgresql_endpoint" {
  value     = module.rds.postgresql_endpoint
  sensitive = true
}

output "rds_mysql_endpoint" {
  value     = module.rds.mysql_endpoint
  sensitive = true
}

output "rds_mongodb_endpoint" {
  value     = module.rds.mongodb_endpoint
  sensitive = true
}

output "alb_dns_name" {
  value = module.networking.alb_dns_name
}

output "app_storage_bucket" {
  value = var.environment != "dev" ? aws_s3_bucket.app_storage[0].id : ""
}