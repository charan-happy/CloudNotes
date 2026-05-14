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
  description = "Subnet IDs for ALB"
  type        = list(string)
}

variable "internal_alb" {
  description = "Create internal ALB"
  type        = bool
  default     = false
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection on ALB"
  type        = bool
  default     = false
}

variable "enable_alb_logs" {
  description = "Enable ALB access logs"
  type        = bool
  default     = false
}

variable "alb_log_bucket" {
  description = "S3 bucket for ALB logs"
  type        = string
  default     = ""
}

variable "alb_log_prefix" {
  description = "S3 prefix for ALB logs"
  type        = string
  default     = "alb-logs"
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "create_acm_certificate" {
  description = "Create ACM certificate"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = ""
}

variable "subject_alternative_names" {
  description = "Subject alternative names for ACM certificate"
  type        = list(string)
  default     = []
}

variable "validate_acm_certificate" {
  description = "Validate ACM certificate via DNS"
  type        = bool
  default     = false
}

variable "validation_record_fqdns" {
  description = "Validation record FQDNs"
  type        = list(string)
  default     = []
}

variable "create_route53_records" {
  description = "Create Route53 records"
  type        = bool
  default     = false
}

variable "route53_zone_name" {
  description = "Route53 zone name"
  type        = string
  default     = ""
}

variable "create_www_record" {
  description = "Create www subdomain record"
  type        = bool
  default     = false
}

variable "create_internal_zone" {
  description = "Create internal Route53 zone"
  type        = bool
  default     = false
}

variable "internal_domain_name" {
  description = "Internal domain name"
  type        = string
  default     = "internal.cloudnotes.local"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}