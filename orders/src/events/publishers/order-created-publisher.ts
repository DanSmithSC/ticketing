import { Publisher, OrderCreatedEvent, Subjects } from "@denziktickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}