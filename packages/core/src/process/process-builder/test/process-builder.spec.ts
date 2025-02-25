import { createContextBuilder } from '../../../context';
import { addRelation, addStep, createProcessBuilder } from '../process-builder';
import { getProcessFactory, Process, ProcessName } from '../../process';
import { defaultContextFactory } from '../../../context/context-builder';

describe('process-manager', () => {
  describe('process-builder', () => {
    type State = 'in-progress' | 'closed';
    type Command = 'to-work' | 'close';
    type Payload = number;
    const processName: ProcessName = {
      name: 'to-do-process',
      version: '1.0',
    };

    it('create empty process', () => {
      const context = createContextBuilder().build(defaultContextFactory);
      const process = createProcessBuilder(processName, context).build<
        Process<State, Payload, Command>
      >(getProcessFactory());

      expect(process).toBeDefined();
      expect(process.processName).toEqual({ ...processName });
      expect(process.graph.edges.length).toEqual(0);
      expect(process.graph.nodes.length).toEqual(0);
    });

    it('add steps', () => {
      const context = createContextBuilder().build(defaultContextFactory);
      const process = createProcessBuilder<State, Payload, Command>(
        processName,
        context
      )
        .pipe(addStep('in-progress' as State), addStep('closed' as State))
        .build<Process<State, Payload, Command>>(getProcessFactory());

      const inProgressStep = process.graph.searchNodes(
        (n) => n.status === 'in-progress'
      )[0];
      const closedStep = process.graph.searchNodes(
        (n) => n.status === 'closed'
      )[0];

      expect(inProgressStep).toBeDefined();
      expect(inProgressStep.value.processName).toEqual(processName);
      expect(closedStep).toBeDefined();
      expect(closedStep.value.processName).toEqual(processName);
    });

    it('add relation', () => {
      const context = createContextBuilder().build(defaultContextFactory);
      const process = createProcessBuilder<State, Payload, Command>(
        processName,
        context
      )
        .pipe(addStep('in-progress' as State), addStep('closed' as State))
        .pipe(
          addRelation<State, number, Command>('in-progress', 'closed', 'close')
        )
        .build<Process<State, Payload, Command>>(getProcessFactory());

      const closeEdge = process.graph.searchEdges(
        (n) => n.command === 'close'
      )[0];

      expect(closeEdge).toBeDefined();
      expect(closeEdge.start).toEqual(0);
      expect(closeEdge.end).toEqual(1);
      expect(closeEdge.weight.command).toEqual('close');
    });
  });
});
