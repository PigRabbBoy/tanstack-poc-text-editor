export type TemplateVariable = {
	name: string;
	label: string;
	sample: string;
};

/** Template variables, written as `{{name}}` in markdown and rendered as atomic chips. */
export const VARIABLES: TemplateVariable[] = [
	{ name: "customer_name", label: "Customer name", sample: "บริษัท ตัวอย่าง จำกัด" },
	{ name: "contract_id", label: "Contract ID", sample: "CT-2026-0042" },
	{ name: "due_date", label: "Due date", sample: "31 ต.ค. 2569" },
	{ name: "amount", label: "Amount", sample: "฿125,000" },
	{ name: "sales_rep", label: "Sales rep", sample: "Suda Rakthai" },
];

export const VARIABLE_SAMPLES: Record<string, string> = Object.fromEntries(
	VARIABLES.map((variable) => [variable.name, variable.sample]),
);
