output "alb_arn" {
  value = aws_lb.main.arn
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "target_group_http_arn" {
  value = aws_lb_target_group.http.arn
}

output "target_group_https_arn" {
  value = aws_lb_target_group.https.arn
}

output "acm_certificate_arn" {
  value = var.create_acm_certificate ? aws_acm_certificate.main[0].arn : var.acm_certificate_arn
}

output "route53_zone_id" {
  value = var.create_route53_records ? data.aws_route53_zone.main[0].zone_id : ""
}

output "internal_zone_id" {
  value = var.create_internal_zone ? aws_route53_zone.internal[0].zone_id : ""
}