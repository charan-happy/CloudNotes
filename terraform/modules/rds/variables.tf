variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for RDS"
  type        = list(string)
}

variable "allowed_security_groups" {
  description = "Security groups allowed to access RDS"
  type        = list(string)
  default     = []
}

variable "port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "enable_postgresql" {
  description = "Enable PostgreSQL instance"
  type        = bool
  default     = true
}

variable "postgresql_db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "cloudnotes"
}

variable "postgresql_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "cloudnotes_admin"
}

variable "postgresql_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "postgresql_instance_class" {
  description = "PostgreSQL instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "postgresql_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "postgresql_allocated_storage" {
  description = "PostgreSQL allocated storage in GB"
  type        = number
  default     = 20
}

variable "postgresql_max_allocated_storage" {
  description = "PostgreSQL max allocated storage in GB"
  type        = number
  default     = 100
}

variable "enable_mysql" {
  description = "Enable MySQL instance"
  type        = bool
  default     = true
}

variable "mysql_db_name" {
  description = "MySQL database name"
  type        = string
  default     = "cloudnotes_users"
}

variable "mysql_username" {
  description = "MySQL master username"
  type        = string
  default     = "cloudnotes_admin"
}

variable "mysql_password" {
  description = "MySQL master password"
  type        = string
  sensitive   = true
}

variable "mysql_instance_class" {
  description = "MySQL instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "mysql_version" {
  description = "MySQL engine version"
  type        = string
  default     = "8.0.35"
}

variable "mysql_allocated_storage" {
  description = "MySQL allocated storage in GB"
  type        = number
  default     = 20
}

variable "mysql_max_allocated_storage" {
  description = "MySQL max allocated storage in GB"
  type        = number
  default     = 100
}

variable "enable_mongodb" {
  description = "Enable MongoDB (DocumentDB) instance"
  type        = bool
  default     = true
}

variable "mongodb_db_name" {
  description = "MongoDB database name"
  type        = string
  default     = "cloudnotes_notes"
}

variable "mongodb_username" {
  description = "MongoDB master username"
  type        = string
  default     = "cloudnotes_admin"
}

variable "mongodb_password" {
  description = "MongoDB master password"
  type        = string
  sensitive   = true
}

variable "mongodb_instance_class" {
  description = "MongoDB instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "mongodb_version" {
  description = "MongoDB engine version"
  type        = string
  default     = "5.0"
}

variable "mongodb_allocated_storage" {
  description = "MongoDB allocated storage in GB"
  type        = number
  default     = 20
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "backup_retention" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "mon:04:00-mon:05:00"
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion"
  type        = bool
  default     = false
}

variable "enable_secrets" {
  description = "Store credentials in Secrets Manager"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}