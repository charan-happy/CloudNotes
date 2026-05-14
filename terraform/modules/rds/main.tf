resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, { Name = "${var.project}-db-subnet-group" })
}

resource "aws_security_group" "rds" {
  name        = "${var.project}-${var.environment}-rds-sg"
  description = "Security group for RDS instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.port
    to_port         = var.port
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_db_instance" "postgresql" {
  count = var.enable_postgresql ? 1 : 0

  identifier     = "${var.project}-${var.environment}-postgres"
  engine         = "postgres"
  engine_version = var.postgresql_version
  instance_class = var.postgresql_instance_class

  allocated_storage     = var.postgresql_allocated_storage
  max_allocated_storage = var.postgresql_max_allocated_storage
  storage_encrypted     = true
  storage_type          = "gp3"

  db_name  = var.postgresql_db_name
  username = var.postgresql_username
  password = var.postgresql_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.backup_retention
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  multi_az = var.multi_az

  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project}-${var.environment}-final-snapshot"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = merge(var.tags, { Name = "${var.project}-postgres-${var.environment}" })
}

resource "aws_db_instance" "mysql" {
  count = var.enable_mysql ? 1 : 0

  identifier     = "${var.project}-${var.environment}-mysql"
  engine         = "mysql"
  engine_version = var.mysql_version
  instance_class = var.mysql_instance_class

  allocated_storage     = var.mysql_allocated_storage
  max_allocated_storage = var.mysql_max_allocated_storage
  storage_encrypted     = true
  storage_type          = "gp3"

  db_name  = var.mysql_db_name
  username = var.mysql_username
  password = var.mysql_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.backup_retention
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  multi_az = var.multi_az

  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project}-${var.environment}-mysql-final-snapshot"

  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]

  tags = merge(var.tags, { Name = "${var.project}-mysql-${var.environment}" })
}

resource "aws_db_instance" "mongodb" {
  count = var.enable_mongodb ? 1 : 0

  identifier     = "${var.project}-${var.environment}-mongodb"
  engine         = "docdb"
  engine_version = var.mongodb_version
  instance_class = var.mongodb_instance_class

  allocated_storage    = var.mongodb_allocated_storage
  storage_encrypted    = true
  storage_type         = "gp3"

  db_name  = var.mongodb_db_name
  username = var.mongodb_username
  password = var.mongodb_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.backup_retention
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project}-${var.environment}-mongo-final-snapshot"

  tags = merge(var.tags, { Name = "${var.project}-mongodb-${var.environment}" })
}

resource "aws_secretsmanager_secret" "db_credentials" {
  count = var.enable_secrets ? 1 : 0

  name = "${var.project}/${var.environment}/db-credentials"

  recovery_window_in_days = 0

  tags = var.tags
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  count = var.enable_secrets ? 1 : 0

  secret_id = aws_secretsmanager_secret.db_credentials[0].id

  secret_string = jsonencode({
    postgresql = {
      host     = var.enable_postgresql ? aws_db_instance.postgresql[0].address : ""
      port     = var.enable_postgresql ? aws_db_instance.postgresql[0].port : ""
      dbname   = var.postgresql_db_name
      username = var.postgresql_username
      password = var.postgresql_password
    }
    mysql = {
      host     = var.enable_mysql ? aws_db_instance.mysql[0].address : ""
      port     = var.enable_mysql ? aws_db_instance.mysql[0].port : ""
      dbname   = var.mysql_db_name
      username = var.mysql_username
      password = var.mysql_password
    }
  })

  depends_on = [aws_db_instance.postgresql, aws_db_instance.mysql, aws_db_instance.mongodb]
}