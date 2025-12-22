import time
from rest_framework.decorators import api_view
from rest_framework.response import Response

# --------------------------------------------
# RAM içinde audit geçmişi tutulan liste
# --------------------------------------------
AUDIT_HISTORY = []


# --------------------------------------------
# MOCK blockchain transaction function
# (Gerçek TX hash burada üretiliyor)
# --------------------------------------------
def blockchain_submit(contract_name, summary):
    import uuid
    return uuid.uuid4().hex[:32]


# --------------------------------------------
# SAVE AUDIT → Blockchain + Memory
# --------------------------------------------
@api_view(["POST"])
def save_audit(request):
    contract_name = request.data.get("contract_name", "Unknown")
    summary = request.data.get("summary", "")

    tx_hash = blockchain_submit(contract_name, summary)

    entry = {
        "contract_name": contract_name,
        "summary": summary,
        "timestamp": int(time.time()),
        "tx_hash": tx_hash,
    }

    AUDIT_HISTORY.append(entry)

    return Response({
        "message": "Audit saved",
        "tx_hash": tx_hash
    })


# --------------------------------------------
# GET AUDIT HISTORY
# --------------------------------------------
@api_view(["GET"])
def audit_history(request):
    sorted_history = sorted(AUDIT_HISTORY, key=lambda x: x["timestamp"], reverse=True)

    return Response({
        "audits": sorted_history
    })
