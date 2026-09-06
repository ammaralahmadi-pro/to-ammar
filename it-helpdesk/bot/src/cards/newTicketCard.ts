/** نموذج Adaptive Card لفتح تذكرة جديدة، معبّأ ديناميكيًا بالتصنيفات من الـ API. */
export function buildNewTicketCard(categories: { id: string; name: string }[]) {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      { type: "TextBlock", text: "فتح تذكرة دعم فني جديدة", weight: "Bolder", size: "Medium" },
      {
        type: "Input.Text",
        id: "title",
        label: "عنوان مختصر للمشكلة",
        isRequired: true,
        errorMessage: "الرجاء كتابة عنوان",
      },
      {
        type: "Input.ChoiceSet",
        id: "categoryId",
        label: "نوع المشكلة",
        isRequired: true,
        errorMessage: "الرجاء اختيار نوع المشكلة",
        choices: categories.map((c) => ({ title: c.name, value: c.id })),
      },
      {
        type: "Input.Text",
        id: "description",
        label: "تفاصيل المشكلة",
        isMultiline: true,
        isRequired: true,
        errorMessage: "الرجاء وصف المشكلة",
      },
    ],
    actions: [{ type: "Action.Submit", title: "إرسال التذكرة", data: { action: "submitNewTicket" } }],
  };
}

export function buildTicketConfirmationCard(ticket: { id: string; title: string; priority: { name: string } }) {
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      { type: "TextBlock", text: "✅ تم فتح التذكرة بنجاح", weight: "Bolder", color: "Good" },
      {
        type: "FactSet",
        facts: [
          { title: "رقم التذكرة", value: `#${ticket.id.slice(0, 8)}` },
          { title: "العنوان", value: ticket.title },
          { title: "الأولوية", value: ticket.priority.name },
        ],
      },
    ],
  };
}
