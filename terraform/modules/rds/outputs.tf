output "postgresql_endpoint" {
  value     = var.enable_postgresql ? aws_db_instance.postgresql[0].endpoint : ""
  sensitive = true
}

output "postgresql_port" {
  value = var.enable_postgresql ? aws_db_instance.postgresql[0].port : 0
}

output "mysql_endpoint" {
  value     = var.enable_mysql ? aws_db_instance.mysql[0].endpoint : ""
  sensitive = true
}

output "mysql_port" {
  value = var.enable_mysql ? aws_db_instance.mysql[0].port : 0
}

output "mongodb_endpoint" {
  value     = var.enable_mongodb ? aws_db_instance.mongodb[0].endpoint : ""
  sensitive = true
}

output "mongodb_port" {
  value = var.enable_mongodb ? aws_db_instance.mongodb[0].port : 0
}

output "db_security_group_id" {
  value = aws_security_group.rds.id
}