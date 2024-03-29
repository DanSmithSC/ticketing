import { Publisher, OrderCancelledEvent, Subjects } from "@denziktickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled 
}