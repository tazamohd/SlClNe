ALTER TABLE "customer_feedback" ADD CONSTRAINT "customer_feedback_rating_range" CHECK (rating BETWEEN 1 AND 5);--> statement-breakpoint
ALTER TABLE "estimate_lines" ADD CONSTRAINT "estimate_lines_qty_positive" CHECK (qty > 0);--> statement-breakpoint
ALTER TABLE "estimate_lines" ADD CONSTRAINT "estimate_lines_unit_price_non_negative" CHECK (unit_price_halalas >= 0);--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_qty_positive" CHECK (qty >= 1);--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_qty_positive" CHECK (qty > 0);--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_unit_price_non_negative" CHECK (unit_price_halalas >= 0);--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_price_non_negative" CHECK (price_halalas >= 0);--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_cost_non_negative" CHECK (cost_halalas IS NULL OR cost_halalas >= 0);--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_on_hand_non_negative" CHECK (on_hand >= 0);--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_reserved_non_negative" CHECK (reserved >= 0);--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_reorder_level_non_negative" CHECK (reorder_level >= 0);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_positive" CHECK (amount_halalas > 0);--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "po_lines_qty_positive" CHECK (qty >= 1);--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "po_lines_received_qty_non_negative" CHECK (received_qty >= 0);--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_amount_non_negative" CHECK (amount_halalas >= 0);--> statement-breakpoint
ALTER TABLE "requisition_lines" ADD CONSTRAINT "requisition_lines_qty_positive" CHECK (qty >= 1);--> statement-breakpoint
ALTER TABLE "requisition_lines" ADD CONSTRAINT "requisition_lines_est_unit_price_non_negative" CHECK (est_unit_price_halalas >= 0);