import { Subjects, Publisher, ExpirationCompleteEvent } from "@denziktickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete;
}