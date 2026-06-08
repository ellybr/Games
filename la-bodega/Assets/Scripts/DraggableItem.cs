using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class DraggableItem : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    public BodegaDayController.ItemType itemType;
    public BodegaDayController controller;

    RectTransform rt;
    Canvas canvas;
    RectTransform canvasRT;
    GameObject ghost;

    void Awake()
    {
        rt = GetComponent<RectTransform>();
        canvas = GetComponentInParent<Canvas>();
        canvasRT = canvas.GetComponent<RectTransform>();
    }

    public void OnBeginDrag(PointerEventData e)
    {
        ghost = Instantiate(gameObject, canvas.transform);
        ghost.transform.SetAsLastSibling();
        var ghostDrag = ghost.GetComponent<DraggableItem>();
        if (ghostDrag != null) ghostDrag.enabled = false;
        var cg = ghost.GetComponent<CanvasGroup>();
        if (cg == null) cg = ghost.AddComponent<CanvasGroup>();
        cg.blocksRaycasts = false;
        cg.alpha = 0.75f;
        MoveGhost(e);
    }

    public void OnDrag(PointerEventData e) => MoveGhost(e);

    public void OnEndDrag(PointerEventData e)
    {
        if (ghost != null) { Destroy(ghost); ghost = null; }
        controller?.TryServeAtScreenPoint(e.position, itemType, e.pressEventCamera);
    }

    void MoveGhost(PointerEventData e)
    {
        if (ghost == null) return;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            canvasRT, e.position, e.pressEventCamera, out var local);
        ghost.GetComponent<RectTransform>().anchoredPosition = local;
    }
}
