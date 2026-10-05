# ใบเสนอราคา / Quotation for {{customer_name}}

เรียน {{customer_name}} — ขอบคุณที่ไว้วางใจ **Boonmee Lab** ให้ดูแลโครงการนี้ เอกสารฉบับนี้ใช้ทดสอบการพิมพ์ภาษาไทย การตัดคำ สระ และวรรณยุกต์ เช่น *น้ำ ผู้ใหญ่ กุ้ง ฤๅษี* ปนกับ English text ในบรรทัดเดียวกัน

## Summary

This quotation covers contract **{{contract_id}}** with a total of {{amount}}, due on {{due_date}}. Your contact is [@Suda Rakthai](mention:u2); escalations go to [@สมชาย ใจดี](mention:u1).

Inline styles: **bold**, *italic*, ~~strikethrough~~, `inline code`, and a [link to Boonmee Lab](https://boonmeelab.com).

### Scope of work

1. Discovery workshop (ประชุมเก็บ requirement)
2. Design system alignment
3. Editor integration
   - Rich text basics
   - Block editing with slash commands
   - Template variables and mentions

### Checklist

- [x] Send draft to {{sales_rep}}
- [ ] Legal review by [@John Carter](mention:u5)
- [ ] ลูกค้าเซ็นยืนยัน

> หมายเหตุ: ราคานี้ยืนราคา 30 วัน นับจากวันที่ออกเอกสาร
> This price is valid for 30 days from the issue date.

## Pricing

| Item | Qty | Price |
| --- | --- | --- |
| Discovery | 1 | ฿25,000 |
| Implementation | 1 | ฿100,000 |
| **Total** | | **{{amount}}** |

```ts
// Variables are filled at render time
const greeting = `Hello ${customer.name}`;
```

---

![Boonmee Lab wordmark](/brand/wordmark.png)

ขอแสดงความนับถือ,
{{sales_rep}}
